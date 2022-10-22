<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element\Contract;

use Drjele\Symfony\JsonForm\Exception\Exception;

abstract class AbstractElement
{
    public function __construct(
        private readonly string $name,
        private readonly ?string $label
    ) {
    }

    abstract protected function getType(): string;

    abstract protected function renderElement(mixed $value): array;

    final public function getName(): string
    {
        return $this->name;
    }

    final public function render(mixed $value): array
    {
        if (false === \ctype_alnum($this->name)) {
            throw new Exception(
                \sprintf('invalid element name `%s`', $this->name)
            );
        }

        return [
            'type' => $this->getType(),
            'name' => $this->name,
            'label' => $this->label,
        ] + $this->renderElement($value);
    }
}
