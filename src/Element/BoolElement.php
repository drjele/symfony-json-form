<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Exception\InvalidValueException;
use Symfony\Contracts\Translation\TranslatorInterface;

/** checkbox html element */
class BoolElement extends AbstractElement
{
    public function __construct(
        protected readonly string $name,
        protected readonly string $label,
        protected readonly bool $required = true
    ) {
    }

    protected function getType(): string
    {
        return 'bool';
    }

    protected function renderElement(mixed $value, ?TranslatorInterface $translator): array
    {
        if (null !== $value && false === \is_bool($value)) {
            throw new InvalidValueException($this->name, $value);
        }

        return [
            'required' => $this->required,
            'value' => $value,
        ];
    }
}
