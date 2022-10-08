<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Exception\Exception;
use Symfony\Contracts\Translation\TranslatorInterface;

abstract class AbstractElement
{
    protected readonly string $name;
    protected readonly string $label;

    abstract protected function getType(): string;

    abstract protected function renderElement(mixed $value, ?TranslatorInterface $translator): array;

    final public function getName(): string
    {
        return $this->name;
    }

    final public function render(mixed $value, ?TranslatorInterface $translator): array
    {
        if (false === \ctype_alnum($this->name)) {
            throw new Exception(
                \sprintf('invalid element name `%s`', $this->name)
            );
        }

        return [
            'type' => $this->getType(),
            'name' => $this->name,
            'label' => null !== $translator ? $translator->trans($this->label) : $this->label,
        ] + $this->renderElement($value, $translator);
    }
}
